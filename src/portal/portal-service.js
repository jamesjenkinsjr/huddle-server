const PortalService = {
  getPortalByID: (db, id) => {
    return db('portal')
      .select('*')
      .where({id})
      .first();
  },
  addPortal: (db, data) => {
    return db('portal')
      .insert(data)
      .returning('*')
      .then(portal => portal[0])
      .then(portal => {
        return PortalService.getPortalByID(db, portal.id);
      });
  },
  getMessagesForPortal: (db, portal_id) => {
    return db('message')
      .select('*')
      .where({portal_id});
  },
  deletePortal: (db, id) => {
    return db('portal')
      .delete()
      .where({id});
  }
};

module.exports = PortalService;