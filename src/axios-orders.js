import axios from 'axios';

const instance = axios.create({
    baseURL: ' https://burgerbuildernew.firebaseio.com/'
});

export default instance;