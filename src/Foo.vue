<template id="foo">
  <div>
      <h1>{{ msg }}</h1>
      <ul>
          <li v-for="user in users">
              {{ user.name }} - {{ user.email }}
          </li>
      </ul>
  </div>
</template>

<script>
module.exports = {
  data: function() {
    return {
      msg: '',
      users: []
    }
  },
  mounted: function() {
    this.getData();
  },
  methods: {
    getData: function() {
      var self = this;
      $.ajax({
        method: "GET",
        url: "/users.json",
        data: { id: this.$route.params.id }
      })
      .done(function( data ) {
        self.msg = 'Hello World';
        self.users = data;
      })
      .fail(function( jqXHR, textStatus ) {
        alert( textStatus );
      });
    }
  }
}
</script>
