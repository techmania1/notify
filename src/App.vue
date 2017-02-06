<template>
  <div id="app">
      <nav class="navbar navbar-inverse">
          <div class="container">
              <router-link to="/" class="navbar-brand">
                  <i class="glyphicon glyphicon-time"></i> noTIfy
              </router-link>
              <ul class="nav navbar-nav">
                  <li>
                      <router-link to="/foo/123">Foo</router-link>
                  </li>
                  <li>
                      <router-link to="/bar">Bar</router-link>
                  </li>
                  <li>
                      <router-link to="/baz">Baz</router-link>
                  </li>
              </ul>
          </div>
      </nav>
      <div class="container">
        <h1 v-if="$route.path==='/'">Hello Techmania</h1>
        <router-view></router-view>
      </div>
    </div>
</template>
