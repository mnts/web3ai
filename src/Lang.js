window.Lang = {
  acc: {
    title: 'First and Last name',
    become_publisher: 'Upload an intro video to be a payed pulisher',
    add_social: 'Add social media account',
    confirm_email: 'confirm your email'
  },

  subs: {
	intro_video: 'To use payed subscribtion, upload video introducing yourself',
    pending_tip: 'Waiting for payment. Click to unsubscribe',
    pending: 'Pending',
    unsubscribe: 'Subscribed'
  },

  components: {
    'fractal-comments': {
      write: 'Write your comment'
    },
    'ilunafriq-story': {
      confirm_remove: 'Are you sure you wanna remove it?'
    }
  }
};

if(window.Lang_site){
  $.extend(true, Lang, Lang_site);
}

export default Lang;