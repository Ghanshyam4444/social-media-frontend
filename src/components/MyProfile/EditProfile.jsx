import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  CircularProgress,
  Box,
} from "@mui/material";
import { useAuth } from "../../store/auth";

const EditProfile = ({ open, onClose, onUpdate, currentName, currentBio }) => {
  const { user } = useAuth();
  const [name, setName] = useState(currentName || "");
  const [bio, setBio] = useState(currentBio || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.Bio || "");
      setLoading(false);
    }
  }, [user]);

  const handleUpdate = () => {
    onUpdate({ name, bio });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "200px",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogContent>
            <TextField
              label="Change Name"
              fullWidth
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              label="Change Bio"
              fullWidth
              multiline
              rows={3}
              margin="normal"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleUpdate} color="primary" variant="contained">
              Update
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default EditProfile;
