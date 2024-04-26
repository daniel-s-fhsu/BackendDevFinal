const data = {
    states: require('../model/statesData.json'),
    setStates: function (data) { this.states = data }
};

const getAllStates = (req, res) => {
    res.json(data.states);
};

const getState = (req, res) => {
    const state = data.states.find(st => st.code === req.params.state.toUpperCase());
    if(!state) return res.status(400).json({ "error": "404 Not Found"});
    res.json(state);
};

module.exports = {
    getAllStates,
    getState
};