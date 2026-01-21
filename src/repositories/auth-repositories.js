const CrudRepository = require('./crud-repositories');
const { User } = require('../models');

class AuthRepository extends CrudRepository {
  constructor() {
    super(User);
  }

  async getByFilter(filter) {
    const response = await User.findOne(filter);
    return response;
  }
}

module.exports = AuthRepository;
