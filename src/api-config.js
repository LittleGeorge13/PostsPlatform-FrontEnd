export const getBaseUrl = () => {
    // eslint-disable-next-line no-restricted-globals
    const url = location.href;
    if (url.includes('localhost')) {
        return 'http://localhost:8080';
    } else { 
        return 'https://postsplatform-backend.onrender.com';
    }
}