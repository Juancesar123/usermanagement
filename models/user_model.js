const Joi = require('@hapi/joi');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    created_at: { type: Date, default: null },
    deleted_at: { type: Date, default: null },
    updated_at: { type: Date, default: null }
});
userSchema.plugin(mongoosePaginate);
const User = mongoose.model('User', userSchema, 'user');

function validateUser(user) {
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().required(),
        password: Joi.string().required(),
    });
     return schema.validate(user, { allowUnknown: true });
}

module.exports.userSchema = userSchema;
module.exports.User = User;
module.exports.validateUser = validateUser;