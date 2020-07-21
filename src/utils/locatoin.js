const locationMessage = (username, received) => {
    return {
        username,
       location: `https://google.com/maps?q=${received.long},${received.latit}`,
       createdAt: new Date().getTime()
    }
}

module.exports = {
    locationMessage
}