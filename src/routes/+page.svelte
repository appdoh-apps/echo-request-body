<script>
	import Output from './Output.svelte';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Echo request body demo app" />
</svelte:head>

<section>
	<h1>
		Echo Request Body
	</h1>

	<Output />
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}

</style>
