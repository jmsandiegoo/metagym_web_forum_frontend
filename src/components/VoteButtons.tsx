import { IconButton, Stack } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { SyntheticEvent, useEffect, useState } from "react";
import axios from "axios";
import { setErrorFeedback } from "../store/feedbackSlice";
import { Thread, Comment, VoteRequest } from "../types";
import { downvoteThread, upvoteThread } from "../store/threadThunks";
import { upvoteComment, downvoteComment } from "../store/commentThunks";

interface VoteButtonsProps {
  data: Thread | Comment;
}

const VoteButtons = ({ data }: VoteButtonsProps) => {
  const { authUser } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [typeIsThread, setTypeIsThread] = useState<boolean>(true);
  const [voteCount, setVoteCount] = useState<number>(0);
  const [isUpvoteActive, setIsUpvoteActive] = useState<boolean>(false);
  const [isDownvoteActive, setIsDownvoteActive] = useState<boolean>(false);

  useEffect(() => {
    const upvotes = data.usersLiked ? data.usersLiked.length : 0;
    const downvotes = data.usersDisliked ? data.usersDisliked.length : 0;
    setVoteCount(upvotes - downvotes);

    // detect type
    setTypeIsThread(isThread(data));
  }, []);

  const isThread = (obj: Thread | Comment): obj is Thread => {
    return (obj as Thread).title !== undefined;
  };

  useEffect(() => {
    const userLiked = data.usersLiked?.find(
      (u) => u.userId === authUser?.userId
    );
    const userDisliked = data.usersDisliked?.find(
      (u) => u.userId === authUser?.userId
    );

    if (userLiked) {
      setIsDownvoteActive(false);
      setIsUpvoteActive(true);
    }

    if (userDisliked) {
      setIsUpvoteActive(false);
      setIsDownvoteActive(true);
    }
  }, [data]);

  const handleUpvote = async (e: SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const addVote = isDownvoteActive ? 2 : 1;

    try {
      if (isUpvoteActive) {
        setVoteCount((prev) => prev - addVote);
        setIsUpvoteActive(false);
        setIsDownvoteActive(false);
      } else {
        setVoteCount((prev) => prev + addVote);
        setIsUpvoteActive(true);
        setIsDownvoteActive(false);
      }

      // dispatch upvote
      const flagVal: boolean = !isUpvoteActive;
      if (typeIsThread) {
        await dispatch(
          upvoteThread({
            threadId: (data as Thread).threadId,
            flag: flagVal,
          })
        ).unwrap();
      } else {
        await dispatch(
          upvoteComment({
            commentId: (data as Comment).commentId,
            flag: flagVal,
          })
        ).unwrap();
      }
    } catch (e) {
      setVoteCount((prev) => prev - addVote);
      setIsUpvoteActive(false);
      setIsDownvoteActive(false);
    }
  };

  const handleDownvote = async (e: SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const subVote = isUpvoteActive ? 2 : 1;
    try {
      if (isDownvoteActive) {
        setVoteCount((prev) => prev + subVote);
        setIsUpvoteActive(false);
        setIsDownvoteActive(false);
      } else {
        setVoteCount((prev) => prev - subVote);
        setIsUpvoteActive(false);
        setIsDownvoteActive(true);
      }

      // dispatch downvote
      const flagVal: boolean = !isDownvoteActive;
      if (typeIsThread) {
        await dispatch(
          downvoteThread({
            threadId: (data as Thread).threadId,
            flag: flagVal,
          })
        ).unwrap();
      } else {
        await dispatch(
          downvoteComment({
            commentId: (data as Comment).commentId,
            flag: flagVal,
          })
        ).unwrap();
      }
    } catch (e) {
      setVoteCount((prev) => prev + subVote);
      setIsUpvoteActive(false);
      setIsDownvoteActive(false);
    }
  };

  return (
    <Stack direction="row" alignItems="center">
      <IconButton
        aria-label="upvote"
        size="small"
        onTouchStart={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => handleUpvote(e)}
      >
        <ArrowUpwardIcon
          fontSize="small"
          {...(isUpvoteActive && { color: "primary" })}
        />
      </IconButton>
      {voteCount}
      <IconButton
        aria-label="downvote"
        size="small"
        onTouchStart={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={handleDownvote}
      >
        <ArrowDownwardIcon
          fontSize="small"
          {...(isDownvoteActive && { color: "primary" })}
        />
      </IconButton>
    </Stack>
  );
};

export default VoteButtons;
