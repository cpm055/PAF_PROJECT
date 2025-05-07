package com.example.skillshare.controller;

import com.example.skillshare.dto.CommentDto;
import com.example.skillshare.model.Comment;
import com.example.skillshare.model.User;
import com.example.skillshare.repository.UserRepository;
import com.example.skillshare.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

//dshfpisdhfpgi
@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;
    private final UserRepository userRepository;

    @GetMapping("/{commentId}")
    public ResponseEntity<Comment> getCommentById(@PathVariable String commentId) {
        Comment comment = commentService.getCommentById(commentId);

        // Enrich with user data
        User user = userRepository.findById(comment.getUserId()).orElse(null);
        if (user != null) {
            comment.setUserName(user.getName());
            comment.setUserProfilePicture(user.getProfilePicture());
        }

        return ResponseEntity.ok(comment);
    }




}
