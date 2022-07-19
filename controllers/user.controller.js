exports.allAccess = (req, res) => {
    res.status(200).send("Public Content.");
};
exports.nurseContent = (req, res) => {
    res.status(200).send("User Content.");
};
exports.adminContent = (req, res) => {
    res.status(200).send("Admin Content.");
};