// src/app/components/tag-filter/tag-filter.component.ts
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PinService } from '../../core/services/pin.service';

@Component({
  selector: 'app-tag-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tag-filter.component.html',
  styleUrls: ['./tag-filter.component.scss']
})
export class TagFilterComponent implements OnInit {
  // All unique tags available in the system
  availableTags: string[] = [];
  
  // Tags that are currently selected for filtering
  filteredTags: string[] = [];
  
  // Event to notify parent components when filter changes
  @Output() filterChange = new EventEmitter<string[]>();
  
  constructor(private pinService: PinService) {}
  
  ngOnInit(): void {
    // Load all available tags from the service
    this.loadAvailableTags();
  }
  
  /**
   * Loads all unique tags from the pin service
   */
  loadAvailableTags(): void {
    this.pinService.getAllUniqueTags().subscribe(tags => {
      this.availableTags = tags;
    });
  }
  
  /**
   * Adds a tag to the filtered tags list
   */
  addTagToFilter(tag: string): void {
    // Only add if not already in the filtered tags
    if (!this.filteredTags.includes(tag)) {
      this.filteredTags.push(tag);
      
      // Remove from available tags
      this.availableTags = this.availableTags.filter(t => t !== tag);
      
      // Emit the filter change event
      this.filterChange.emit(this.filteredTags);
    }
  }
  
  /**
   * Removes a tag from the filtered tags list
   */
  removeTagFromFilter(tag: string): void {
    // Remove from filtered tags
    this.filteredTags = this.filteredTags.filter(t => t !== tag);
    
    // Add back to available tags
    if (!this.availableTags.includes(tag)) {
      this.availableTags.push(tag);
      
      // Sort available tags alphabetically
      this.availableTags.sort();
    }
    
    // Emit the filter change event
    this.filterChange.emit(this.filteredTags);
  }
  
  /**
   * Clears all filtered tags
   */
  clearAllFilters(): void {
    // Return all filtered tags to available tags
    this.filteredTags.forEach(tag => {
      if (!this.availableTags.includes(tag)) {
        this.availableTags.push(tag);
      }
    });
    
    // Sort available tags alphabetically
    this.availableTags.sort();
    
    // Clear filtered tags
    this.filteredTags = [];
    
    // Emit the filter change event
    this.filterChange.emit(this.filteredTags);
  }
}



