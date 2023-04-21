package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/maandoh/echo-request-body/models"
	"net/http"
	"sync"
	"time"
)

func main() {
	cache := make([]*models.CacheItem, 0)
	sessionReads := map[string]time.Time{}
	var mutext sync.Mutex

	r := gin.Default()

	// Disable CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "request-id", "session-id"},
		AllowCredentials: false,
		MaxAge:           12 * time.Hour,
	}))

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})

	r.POST("/", func(c *gin.Context) {
		jsonData, _ := c.GetRawData()
		body := string(jsonData)

		mutext.Lock()
		cache = append(cache, &models.CacheItem{
			Timestamp: time.Now(),
			Data:      body,
		})
		mutext.Unlock()

		c.Header("Content-Type", "text/plain")
		c.String(200, body)
	})

	r.GET("/fetch", func(c *gin.Context) {
		sessionId := c.Request.Header.Get("session-id")
		if len(sessionId) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{
				"data": "Session ID is missing!",
			})
			return
		}

		lastReadTime, isOk := sessionReads[sessionId]

		if isOk {
			// Read off the delta since the last recorded time.
			delta := make([]*models.CacheItem, 0)
			for _, cachedItem := range cache {
				if cachedItem.Timestamp.After(lastReadTime) {
					delta = append(delta, cachedItem)
				}
			}

			// Return the delta of changes.
			c.JSON(http.StatusOK, gin.H{
				"data": delta,
			})

			// Clean up any outdated cache.
			mutext.Lock()
			newCache := make([]*models.CacheItem, 0)
			for _, cachedItem := range cache {
				age := time.Now().Sub(cachedItem.Timestamp)
				if age.Seconds() < 10 {
					newCache = append(newCache, cachedItem)
				}
			}
			if len(newCache) > 0 {
				cache = newCache
			}
			mutext.Unlock()
		} else {
			// Return the latest from cache to a newly-connected client.
			c.JSON(http.StatusOK, gin.H{
				"data": cache,
			})
		}

		sessionReads[sessionId] = time.Now()
	})

	r.Run()
}
