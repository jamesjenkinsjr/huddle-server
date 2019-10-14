const PortalService = {
  getPortalByID: (db, id) => {
    return db('portal')
      .select('*')
      .where({id})
      .first()
  },
  addPortal: (db) => {
    return db('portal')
      .insert({})
      .returning('*')
      .then(portal => portal[0])
      .then(portal => {
        return PortalService.getPortalByID(db, portal.id);
      })
  }
};

module.exports = PortalService;