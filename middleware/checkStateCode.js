const data = {
    states: require('../model/statesData.json'),
    setStates: function (data) { this.states = data }
};

const checkStateCode = (req, res, next) => {
    let states = data.states;

    let state = data.states.find(st => st.code === req.params.state.toUpperCase());
    if(!state) return res.status(400).json({ "error": "404 Not Found"});

    next();
};

module.exports = checkStateCode;