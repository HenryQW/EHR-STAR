<template>
  <div>
    <Nav />
    <Nuxt class="mt-2" />
    <Footer />
  </div>
</template>

<style>
html {
  font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
  position: relative;
  min-height: 100%;
}

body {
  margin-bottom: 12em; /* Margin bottom by footer height */
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
}

.footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 12rem; /* Set the fixed height of the footer here */
  background-color: #f5f5f5;
}
</style>
