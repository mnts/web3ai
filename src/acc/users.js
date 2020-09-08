import User from './User.js';

var users = {};

function U(path){
    let user = users[path];
    if(!user) user = users[path] = new User(path);
    return user;
}

export {users, U};