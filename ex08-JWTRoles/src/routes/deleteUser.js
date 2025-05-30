const pool = require("../database/db");
const bcrypt = require("bcrypt");

const deleteUser = async(req, res) => {
    
    const userId = req.user?.userId
    const { Password } = req.body;
    const findUserQuery = "SELECT * FROM users WHERE id = ?";
    
    if (!Password) {
        return res.status(400).json({message: "Password is required"});
    }

    try {
        const [[user]] = await pool.execute(findUserQuery, [userId]);

        if (!user) {
            return res.status(404).json({message: "User not found"});
        }

        const isMatch = await bcrypt.compare(Password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const deleteUserQuery = "DELETE FROM users WHERE id = ?";
        const [deleteResult] = await pool.execute(deleteUserQuery, [userId]);

        if (deleteResult.affectedRows === 0) {
            return res.status(500).json({ error: "Failed to delete user" });
        }

        res.json({
            message: "User deleted successfully",
            user: {
                id: user.id,
                name: user.Name,
            },
        });

    } catch (findError) {
        console.error("❌ Error executing find user query:", findError);
        return res.status(500).json({error: "Database query failed"});
    }
};

module.exports = deleteUser;
