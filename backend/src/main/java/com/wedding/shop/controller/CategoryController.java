package com.wedding.shop.controller;
import com.wedding.shop.model.Category;
import com.wedding.shop.repository.CategoryRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    private final CategoryRepository categories;
    public CategoryController(CategoryRepository categories) { this.categories = categories; }
    @GetMapping
    public List<Category> list() { return categories.findAll(); }
}
