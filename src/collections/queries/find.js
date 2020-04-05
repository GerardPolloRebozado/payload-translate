const { APIError } = require('../../errors');

const find = async (options) => {
  try {
    const {
      Model,
      query,
      locale,
      fallbackLocale,
      paginate,
      depth,
    } = options;

    const mongooseQuery = await Model.buildQuery(query, locale);

    const paginateQuery = {
      options: {},
      ...paginate,
    };

    if (depth) {
      paginateQuery.options.autopopulate = {
        maxDepth: depth,
      };
    }

    const result = await Model.paginate(mongooseQuery, paginateQuery);

    return {
      ...result,
      docs: result.docs.map((doc) => {
        if (locale && doc.setLocale) {
          doc.setLocale(locale, fallbackLocale);
        }

        return doc.toJSON({ virtuals: true });
      }),
    };
  } catch (err) {
    throw new APIError();
  }
};

module.exports = find;
