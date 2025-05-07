package com.example.skillshare.controller;

import com.example.skillshare.dto.CommentDto;
import com.example.skillshare.dto.PostDto;
import com.example.skillshare.model.Comment;
import com.example.skillshare.model.Post;
import com.example.skillshare.model.User;
import com.example.skillshare.repository.UserRepository;
import com.example.skillshare.service.CommentService;
import com.example.skillshare.service.FileStorageService;
import com.example.skillshare.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;
    private final CommentService commentService;
    private final FileStorageService fileStorageService;
    private final UserRepository userRepository;










        PostDto postDto = new PostDto();
        postDto.setContent(content);
        postDto.setSkillCategory(skillCategory);
        postDto.setMediaUrls(mediaUrls);

        Post post = postService.createPost(currentUser.getUsername(), postDto);
        enrichPostWithUserData(post);
        return ResponseEntity.ok(post);
    }



        // Update the post
        Post post = postService.updatePost(currentUser.getUsername(), postId, postDto);
        enrichPostWithUserData(post);
        return ResponseEntity.ok(post);
    }

 







    // Helper methods to enrich posts with user data
    private void enrichPostsWithUserData(Page<Post> posts) {
        for (Post post : posts.getContent()) {
            enrichPostWithUserData(post);
        }
    }

    private void enrichPostWithUserData(Post post) {
        User user = userRepository.findById(post.getUserId()).orElse(null);
        if (user != null) {
            post.setUserName(user.getName());
            post.setUsername(user.getUsername());
            post.setUserProfilePicture(user.getProfilePicture());
        }
    }
}
