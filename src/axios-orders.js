import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://myburgerbuilderprojectnew.firebaseio.com/'
});

export default instance;