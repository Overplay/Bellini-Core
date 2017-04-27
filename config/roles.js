// This is the core roles that will be installed automatically by bootstrap.js
// Additional roles can be added via UI (eventually)

module.exports.roles = {
    coreRoles: [
        { roleName: "admin", subRole: "", roleKey: "admin" },
        { roleName: "user",  subRole: "", roleKey: "user" },
        { roleName: "proprietor", subRole: "owner", roleKey: "proprietor.owner"},
        { roleName: "proprietor", subRole: "manager", roleKey: "proprietor.manager"},
        { roleName: "sponsor", subRole: "", roleKey: "sponsor"}
        ]
};