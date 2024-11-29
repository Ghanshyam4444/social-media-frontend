import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async Thunk for fetching posts
// https://social-media-backend-tau-lilac.vercel.app
export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async ({ page, token }, thunkAPI) => {
    try {
      const response = await fetch(
        `social-media-backend-production-f304.up.railway.app/api/content/getFriendsPosts?page=${page}&limit=3`,
        {
          method: "GET",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      console.log(data.posts);
      if (!response.ok)
        throw new Error(data.message || "Failed to fetch posts");

      return data.posts; // Return the posts array from the backend
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Async Thunk for toggling likes
export const toggleLikePost = createAsyncThunk(
  "posts/toggleLikePost",
  async ({ postId, isLiked, token }, thunkAPI) => {
    try {
      const response = await fetch(
        `social-media-backend-production-f304.up.railway.app/api/content/toggleLike`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({ postId, isLiked }),
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to toggle like");
      //   console.log("data", data);
      return { postId, isLiked: data.isLiked, likes: data.likes }; // Return like data for the post
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Async Thunk for toggling save (new functionality)
export const toggleSavePost = createAsyncThunk(
  "posts/toggleSavePost",
  async ({ postId, isSaved, token }, thunkAPI) => {
    try {
      const response = await fetch(
        `social-media-backend-production-f304.up.railway.app/api/content/toggleSave`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({ postId, isSaved }),
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to toggle save");
      //   console.log("data", data);

      return { postId, isSaved: data.isSaved }; // Return save data for the post
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Posts Slice
const postsSlice = createSlice({
  name: "posts",
  initialState: {
    items: [],
    page: 0,
    loading: false,
    hasMore: true,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = [...state.items, ...action.payload];
        state.page += 3;
        if (action.payload.length === 0) state.hasMore = false;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(toggleLikePost.fulfilled, (state, action) => {
        const { postId, isLiked, likes } = action.payload;
        const post = state.items.find((post) => post._id === postId);
        if (post) {
          post.isLiked = isLiked;
          post.likes = likes;
        }
      })
      .addCase(toggleSavePost.fulfilled, (state, action) => {
        const { postId, isSaved } = action.payload;
        const post = state.items.find((post) => post._id === postId);
        if (post) {
          post.isSaved = isSaved; // Update the isSaved status
        }
      });
  },
});

export default postsSlice.reducer;
