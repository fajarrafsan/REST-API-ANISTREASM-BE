import Joi from "joi";

export const ratingValidation = {
    score: Joi.number().min(0).max(10).integer().required(),
    animeId: Joi.string().min(1).max(255).required()
};
