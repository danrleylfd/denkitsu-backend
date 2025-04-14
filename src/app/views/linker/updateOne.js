const User = require("../../models/auth");
const Linker = require("../../models/linker");

module.exports = async (req, res) => {
  try {
    const { id } = req.query;
    const { oldLabel } = req.params;
    const { newLabel, newLink } = req.body;
    if (!oldLabel || oldLabel.trim().length === 0) return res.status(422).json({ error: "oldLabel missing." });
    if (!newLabel || newLabel.trim().length === 0) return res.status(422).json({ error: "newLabel missing." });
    if (!newLink || newLink.trim().length === 0) return res.status(422).json({ error: "newLink missing." });
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found/exist." });
    let linker = await Linker.findOne({ label: oldLabel });
    if (!linker) return res.status(404).json({ error: "Label not found." });
    if (linker.user.toString() !== id) return res.status(401).json({ error: "You are not the owner of this label." });
    linker.label = newLabel;
    linker.link = newLink;
    await linker.save();
    linker = await Linker.findOne({ user: id });
    return res.status(201).json(linker);
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ error: "Internal server error" })
  }
};
