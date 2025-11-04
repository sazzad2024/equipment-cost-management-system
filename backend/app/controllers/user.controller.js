const db = require("../models");
const User = db.user;

exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};

exports.saveModel = async (req, res) => {
  const { id, county, quarter, category, modelYear, size, subcategory, fueltype, equipment } = req.body;
  const userId = req.userId;

  try {
    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

  // Add the model information to the user's savedModels array (include id/county/quarter when present)
  const modelData = JSON.stringify({ id, county, quarter, category, modelYear, size, subcategory, fueltype, equipment });
    user.savedModels.push(modelData);

    // Save the updated user document
    await user.save();
    res.status(200).send({ message: "Model saved successfully." });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};


exports.getAllModels = async (req, res) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    res.status(200).send({ savedModels: user.savedModels });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};



exports.getUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("roles", "-__v").exec();
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const roles = user.roles.map(role => role.name);
    res.status(200).send({ roles });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// exports.getUserRole = async (req, res) => {
//   try {
//     const user = await db.user.findById(req.userId).populate("roles", "-__v");
//     if (!user) {
//       return res.status(404).send({ message: "User Not Found" });
//     }

//     let roles = user.roles.map(role => role.name); // Extract roles
//     return res.status(200).send({ roles }); // Send roles to frontend
//   } catch (error) {
//     return res.status(500).send({ message: "Error fetching user role" });
//   }
// };



