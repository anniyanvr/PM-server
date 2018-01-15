const fs = require("fs");
const path = require('path');
const async = require("async");

const env = require("../../env/enviroment");

const agentsService = require("../services/agents.service");
const hooks = require("../../libs/hooks/hooks");

module.exports = {
    /* The function will be called every time an agent is registering to the server (agent startup) */
    add: (req, res) => {
        hooks.hookPre('agent-create', req).then(() => {
            return agentsService.add(req.body);
        }).then(agent => {
            // add agent to follow list
            agentsService.followAgent(agent);
            // deploy all plugins on agents
            fs.readdir(path.join(env.static_cdn, env.upload_path), (err, files) => {
                if (err) {
                    console.log(err);
                }
                async.each(files,
                    function (plugin, callback) {
                        let filePath = path.join(env.static_cdn, env.upload_path, plugin);
                        agentsService.installPluginOnAgent(filePath, agent).then(() => {
                        }).catch((e) => {
                            console.log("Error installing on agent", e);
                        });
                        callback();
                    },
                    function (error) {
                        console.log(">", error);
                    });
                res.send('');
            })
        });
    },
    /* Delete an agent */
    delete: (req, res) => {
        hooks.hookPre('agent-delete').then(() => {
            return agentsService.delete(req.params.id)
        }).then(() => {
            res.status(200).send('OK');
            req.io.emit('notification', { title: 'Agent deleted', message: ``, type: 'success' });
        }).catch(error => {
            req.io.emit('notification', { title: 'Whoops...', message: `Error deleting agent`, type: 'error' });
            console.log("Error deleting agent", error);
            res.status(500).send(error);
        });
        agentsService.unfollowAgent(req.params.id);
    },
    /* Get all agents list */
    list: (req, res) => {
        hooks.hookPre('agent-list').then(() => {
            return agentsService.filter({})
        }).then(agents => {
            res.json(agents);
        }).catch(error => {
            req.io.emit('notification', { title: 'Whoops...', message: `Error finding agents`, type: 'error' });
            console.log("Error filtering agents", error);
            res.status(500).send(error);
        });
    },
    /* Get agents status */
    status: (req, res) => {
        hooks.hookPre('agent-status-list', req).then(() => {
            let status = agentsService.agentsStatus();
            if (status) {
                for (let i in status) {
                    delete status[i].intervalId;
                    return res.json(status);
                }
            }
            return res.send('');
        }).catch(error => {
            console.log("Error getting agents status", error);
            return res.status(500).send();
        })
    },
    /* update an agent */
    update: (req, res) => {
        let agent = req.body;
        delete agent._id;
        hooks.hookPre('agent-update', req).then(() => {
            return agentsService.update(req.params.id, agent);
        }).then((agent) => {
            req.io.emit('notification', {
                title: 'Update success',
                message: `${agent.name} updated successfully`,
                type: 'success'
            });
            return res.json(agent);
        }).catch(error => {
            req.io.emit('notification', { title: 'Whoops...', message: `Error updating agent`, type: 'error' });
            console.log("Error updating agent", error);
            res.status(500).send(error);
        });
    }


};
