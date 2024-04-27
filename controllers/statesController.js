const State = require('../model/State');

const data = {
    states: require('../model/statesData.json'),
    setStates: function (data) { this.states = data }
};

const getAllStates = async (req, res) => {
    let states = data.states;
    states.map(async (state) => {
        const dbState = await State.findOne({stateCode: state.code});
        if (dbState) {
            state.funFacts = dbState.funFacts;
        }
    });
    res.json(states);
};

const getState = async (req, res) => {
    let state = data.states.find(st => st.code === req.params.state.toUpperCase());
    if(!state) return res.status(400).json({ "error": "404 Not Found"});

    const dbState = await State.findOne({stateCode: req.params.state.toUpperCase()});

    if (dbState) state.funFacts = dbState.funFacts;

    res.json(state);
};

const createFunFact = async (req, res) => {
    const state = data.states.find(st => st.code == req.params.state.toUpperCase());
    if(!state) return res.status(400).json({ "error": "404 Not Found" });
    const { funfacts } = req.body;
    console.log(req.body);
    if(!funfacts) return res.status(400).json({"error": "funfacts required"});

    // Try to get state from mongo
    const stateDb = await State.findOne({stateCode: req.params.state.toUpperCase()});
    if (!stateDb) {
        // State not found in mongo, but entry found in state data json
        try {
            const newState = await State.create({
                stateCode: req.params.state.toUpperCase(),
                funFacts: funfacts
            });
            state.funFacts = funfacts;
            res.status(201).json(state);
        } catch (err) {
            console.error(err);
        }
    } else {
        // State already exists in mongo, add to existing array
        funfacts.foreach((fact) => stateDb.funFacts.push(fact));
        const result = await stateDb.save();
        res.json(result);
    }
};

const updateFunFact = async (req, res) => {

};

module.exports = {
    getAllStates,
    getState,
    createFunFact,
    updateFunFact
};