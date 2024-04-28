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
            state.funfacts = dbState.funFacts;
        }
    });

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

    if (dbState) stateData.funfacts = dbState.funFacts;

    // Filter if filterInfo provided
    if (req.params.filterInfo) {
        const filterBy = req.params.filterInfo.toUpperCase();
        const { code, funFacts: funfacts, state, capital_city: capital, nickname, population, admission_date: admitted} = stateData;
        switch (filterBy) {
        case "FUNFACT":
            if (funfact) {
                const funfact = funfacts[Math.floor(Math.random()*funfacts.length)];
                stateData = {code, funfact};
            }
            break;
        case "CAPITAL":
            stateData = {state, capital};
            break;
        case "NICKNAME":
            stateData = { state, nickname };
            break;
        case "POPULATION":
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
        try {
            funfacts.forEach((fact) => stateDb.funFacts.push(fact));
            const result = await stateDb.save();
            res.json(result);
        } catch (err) {
            console.error(err);
        }
    }
};

const updateFunFact = async (req, res) => {
    const state = data.states.find(st => st.code == req.params.state.toUpperCase());

    const { index, funfact } = req.body;
    if (!index || !funfact) return res.status(400).json({"error" : "index and funfact required"});

    const stateDb = await State.findOne({stateCode: req.params.state.toUpperCase()});
    if(!stateDb) return res.status(400).json({"error": "state has no funfact"});
    if(!stateDb.funFacts[index-1]) return res.status(400).json({"error": "index not found"});

    stateDb.funFacts[index-1] = funfact;

    const result = await stateDb.save();

    return res.json(result);
};

const deleteFunFact = async (req, res) => {
    const state = data.states.find(st => st.code == req.params.state.toUpperCase());

    const { index, funfact } = req.body;
    if (!index) return res.status(400).json({"error" : "index and funfact required"});

    let stateDb = await State.findOne({stateCode: req.params.state.toUpperCase()});
    if(!stateDb) return res.status(400).json({"error": "state has no funfact"});
    if(!stateDb.funFacts[index-1]) return res.status(400).json({"error": "index not found"});

    const funFactsAfterDelete = stateDb.funFacts.slice(0, index-1).concat(stateDb.funFacts.slice(index));
    stateDb.funFacts = funFactsAfterDelete;

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