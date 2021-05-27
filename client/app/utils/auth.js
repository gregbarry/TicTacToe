export const getCurrentUser = () => {
    const user = localStorage.getItem('user');

    if (!user) {
        return {};
    }

    return JSON.parse(user);
};

export const setCurrentUser = (userData = {}) => {
    const {token} = userData;

    if (token) {
        localStorage.setItem('user', JSON.stringify(userData));
    }
};

export const logout = () => {
    localStorage.removeItem('user');
    window.location.reload();
};
