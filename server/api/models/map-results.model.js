const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const statusEnum = {
    RUNNING: 'running',
    DONE: 'done',
    PENDING: 'pending',
    ERROR: 'error',
    STOPPED: 'stopped'
}

let actionResultSchema = new Schema({
    action: { type: Schema.Types.ObjectId, ref: 'MapStructure.processes.actions' },
    status: String,
    startTime: Date,
    finishTime: Date,
    result: Schema.Types.Mixed,
    retriesLeft: Number 
}, { _id: false });

let processResultSchema = new Schema({
    iterationIndex: Number,
    process: { type: Schema.Types.ObjectId, ref: 'MapStructure.processes' },
    actions: [actionResultSchema],
    status: String, // like process didnt pass condition
    preRunResult: Schema.Types.Mixed,
    postRunResult: Schema.Types.Mixed
}, { _id: false });

let AgentResultSchema = new Schema({
    processes: [processResultSchema],
    agent: { type: Schema.Types.ObjectId, ref: 'Agent' },
    status: { type: String, enum: [statusEnum.DONE, statusEnum.ERROR]},  // todo? is necessary? 
    startTime: Date, // todo? is necessary? 
    finishTime: Date, // todo? is necessary? 
}, { _id: false });


let mapResultSchema = new Schema({
    map: { type: Schema.Types.ObjectId, ref: 'Map' },
    runId: { type: String, required: true },
    // structure: { type: Schema.Types.ObjectId, ref: 'MapStructure' },
    configuration: Schema.Types.Mixed,
    agentsResults: [AgentResultSchema],
    startTime: Date,
    finishTime: Date,
    trigger: String,
    status :{ type: String, enum: [statusEnum.DONE, statusEnum.ERROR,statusEnum.RUNNING, statusEnum.PENDING]},
    reason : String // e.g. no agents 
});

mapResultSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
    }
});

let MapResult = mongoose.model('MapResult', mapResultSchema, 'mapResults');
mongoose.model('AgentResult', AgentResultSchema, 'agentResults');
mongoose.model('ActionResult', AgentResultSchema, 'actionResults');


module.exports = {
    MapResult,
    AgentResult : AgentResultSchema,
    ActionResult : actionResultSchema,
    statusEnum
};