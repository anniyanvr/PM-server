const path = require("path");
const _ = require("lodash");


let pluginsService = require("../services/plugins.service");



module.exports = {
    pluginsList: (req, res) => {
        pluginsService.filterPlugins({}).then((plugins) => {
            return res.json(plugins);
        }).catch(error => {
            req.io.emit('notification', { title: 'Whoops', message: `We couldn't get plugins list`, type: 'error' });
            console.log("Error filtering plugins", error);
            return res.status(500).send(error);
        })

    },

    pluginUpload: (req, res) => {
        console.log("Uploading file");
        let file = req.file;
        let extension = path.extname(file.originalname);
        if (extension && _.indexOf([".zip", ".rar"], extension) === -1) {
            return res.status(500).send("Bad foramt")
        }

        pluginsService.createPlugin(req.file.path, req).then((obj) => {
            req.io.emit('notification', { title: 'Installed plugin', message: `You can now use this plugin`, type: 'success' });
            return res.json(obj);
        }).catch(error => {
            req.io.emit('notification', { title: 'Whoops', message: `Error while installing plugin`, type: 'error' });
            console.log("Error uploading plugin", error);
            return res.status(500).send(error);
        })
    },

    pluginDelete: (req, res) => {
        pluginsService.pluginDelete(req.params.id).then(() => {
            req.io.emit('notification', { title: 'Plugin deleted', message: ``, type: 'success' });
            return res.status(200).send();
        }).catch(error => {
            req.io.emit('notification', { title: 'Whoops', message: `Error deleting plugin`, type: 'error' });
            console.log("Error deleting plugin", error);
            return res.status(500).send(error);
        });
        req.params.id
    }
};