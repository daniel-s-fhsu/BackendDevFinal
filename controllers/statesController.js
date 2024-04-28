const State = require('../model/State');

const data = {
    states: require('../model/statesData.json'),
    setStates: function (data) { this.states = data }
};

const getAllStates = async (req, res) => {
    let states = data.states;
    await Promise.all(states.map(async (state) => {
        const dbState = await State.findOne({stateCode: state.code});
        if (dbState) {
            state.funfacts = dbState.funfacts;
        }
    }));

    // Checking for contig parameter - if present, will filter array
    if (req.query.contig) {
        if (req.query.contig === "true") {
            states = states.filter((state) => (state.code != 'AK' && state.code != 'HI'));
        } else if(req.query.contig === "false") {
            states = states.filter((state) => (state.code == 'AK' || state.code == 'HI'));
        }
    }

    res.json(states);
};

const getState = async (req, res) => {
    let stateData = data.states.find(st => st.code === req.params.state.toUpperCase());

    const dbState = await State.findOne({stateCode: req.params.state.toUpperCase()});

    if (dbState) stateData.funfacts = dbState.funfacts;

    // Filter if filterInfo provided
    if (req.params.filterInfo) {
        const filterBy = req.params.filterInfo.toUpperCase();
        const { code, funfacts, state, capital_city: capital, nickname, population: population_int, admission_date: admitted} = stateData;
        switch (filterBy) {
        case "FUNFACT":
            if (funfacts) {
                const funfact = funfacts[Math.floor(Math.random()*funfacts.length)];
                stateData = {funfact};
            } else {
                stateData = { "message": "No Fun Facts found for " + state}
            }
            break;
        case "CAPITAL":
            stateData = {state, capital};
            break;
        case "NICKNAME":
            stateData = { state, nickname };
            break;
        case "POPULATION":
            const population = population_int.toLocaleString();
            stateData = { state, population };
            break;
        case "ADMISSION":
            stateData = { state, admitted };
            break;
        }
    }

    res.json(stateData);
};

const createFunFact = async (req, res) => {
    const state = data.states.find(st => st.code == req.params.state.toUpperCase());

    const { funfacts } = req.body;

    if(!funfacts) return res.status(400).json({"message": "State fun facts value required"});
    if(!Array.isArray(funfacts)) return res.status(400).json({"message": "State fun facts value must be an array"})

    // Try to get state from mongo
    const stateDb = await State.findOne({stateCode: req.params.state.toUpperCase()});
    if (!stateDb) {
        // State not found in mongo, but entry found in state data json
        try {
            const newState = await State.create({
                stateCode: req.params.state.toUpperCase(),
                funfacts: funfacts
            });
            state.funfacts = funfacts;
            res.status(201).json(state);
        } catch (err) {
            console.error(err);
        }
    } else {
        // State already exists in mongo, add to existing array
        try {
            funfacts.forEach((fact) => stateDb.funfacts.push(fact));
            const result = await stateDb.save();
            state.funfacts = stateDb.funfacts;
            res.json(state);
        } catch (err) {
            console.error(err);
        }
    }
};

const updateFunFact = async (req, res) => {
    const state = data.states.find(st => st.code == req.params.state.toUpperCase());

    const { index, funfact } = req.body;
    if (!index) return res.status(400).json({"message" : "State fun fact index value required"});
    if (!funfact) return res.status(400).json({"message": "State fun fact value required"});

    const stateDb = await State.findOne({stateCode: req.params.state.toUpperCase()});
    if(!stateDb) return res.status(400).json({"message": "No Fun Facts found for " + state.state});
    if(!stateDb.funfacts[index-1]) return res.status(400).json({"message": "No Fun Fact found at that index for " + state.state});

    stateDb.funfacts[index-1] = funfact;

    const result = await stateDb.save();

    return res.json(result);
};

const deleteFunFact = async (req, res) => {
    const state = data.states.find(st => st.code == req.params.state.toUpperCase());

    const { index } = req.body;
    if (!index) return res.status(400).json({"message" : "State fun fact index value required"});

    let stateDb = await State.findOne({stateCode: req.params.state.toUpperCase()});
    if(!stateDb || stateDb.funfacts.length == 0) return res.status(400).json({"message": "No Fun Facts found for " + state.state});
    if(!stateDb.funfacts[index-1]) return res.status(400).json({"message": "No Fun Fact found at that index for " + state.state});

    const funfactsAfterDelete = stateDb.funfacts.slice(0, index-1).concat(stateDb.funfacts.slice(index));
    stateDb.funfacts = funfactsAfterDelete;

    const result = await stateDb.save();

    return res.json(result);
};

module.exports = {
    getAllStates,
    getState,
    createFunFact,
    updateFunFact,
    deleteFunFact
};