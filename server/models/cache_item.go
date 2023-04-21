package models

import "time"

type CacheItem struct {
	Timestamp time.Time `json:"timestamp"`
	Data      string    `json:"data"`
}
