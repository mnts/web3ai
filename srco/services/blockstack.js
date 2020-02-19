var domain = location.host.split('.').slice(-2).join('.'),
    blockstack_name = location.host.split('.').slice(0, -2).join('.');

blockstack_name = location.host.split('.').slice(0, -2).join('.')+'.id.blockstack';

export default {
  name: blockstack_name,
  getUser(){
    if(Index.getBlockstackUser_promise) return Index.getBlockstackUser_promise;
    return Index.getBlockstackUser_promise = new Promise((ok, no) => {
      if(!window.blockstack) no();
      else
      if(blockstack.isUserSignedIn()){
        var user = Index.blockstack_user = blockstack.loadUserData();
        var profile = Index.blockstack_profile = user.profile;
        ok(profile);
      } 
      else 
      if(blockstack.isSignInPending()){
        blockstack.handlePendingSignIn().then(userData => {
          var profile = Index.blockstack_profile = userData;
          ok(profile);
        });
      };
    });
  }
};