import axios from 'axios';


export default function fetchROM( path ) {
    return axios( {
        method: 'get',
        url: '/data/' + path,
        responseType: 'arraybuffer'
    } );
}
