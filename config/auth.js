module.exports = {
    'googleAuth' : {
        'clientID'      : '925901605067-70hvre38sr0r2qh8ocm769kqbtj4bt41.apps.googleusercontent.com',
        'clientSecret'  : 'm7FI4CXxnIVczSmJK2z-0_Mq',
        'callbackURL'   : 'https://jarvis-horizons.herokuapp.com/connect/callback'
    }
};

/// dom added here///
const feelings = ['horny ;)', 'ready for you ;)', 'slack', 'ready to fight Amanda', 'ready to eat a watermelon']
const item = feelings[Math.floor(Math.random()*feelings.length)];
