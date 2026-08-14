const { userModel } = require('../models/usersModel');

exports.createUser = (req, res) => {
    const user = new userModel(req.body);
    user.save()
        .then(doc => {
            res.json(doc);
        })
        .catch(err => {
            res.status(500).send(err);
        });
}

exports.getUserByEmail = (req, res) => {
    const email = req.params.email;
    userModel.findOne({ email: email })
        .then(doc => {
            if (!doc) {
                return res.status(404).send('User not found');
            }
            res.json(doc);
        })
        .catch(err => {
            res.status(500).send(err);
        });
}
