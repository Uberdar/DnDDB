// src/app/components/main-content/main-content.component.ts
// Update the component class with input property and filtering logic

// Add the Input decorator import
import { Component, OnInit, HostListener, AfterViewInit, PLATFORM_ID, Inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PinService, Pin } from '../../core/services/pin.service';

@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.scss']
})
export class MainContentComponent implements OnInit, AfterViewInit, OnChanges {
  // Add the Input property for tag filters
  @Input() tagFilters: string[] = [];
  
  // Currently displayed items
  displayedItems: Pin[] = [];
  // All loaded items (before filtering)
  allLoadedItems: Pin[] = [];
  // Current page for infinite scroll
  page = 0;
  // Items per page
  pageSize = 24;
  // Loading flag
  loading = false;
  // All loaded flag
  allLoaded = false;
  // Debug flag - keep for the template
  usingFallback = false;
  // Debug info - keep for the template
  debugInfo = '';
  // Mock total count
  totalItemCount = 1000;
  
  private isBrowser: boolean;
  
  constructor(
    private pinService: PinService, 
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    console.log('MainContentComponent constructor');
  }
  
  ngOnInit() {
    // Load initial items
    this.loadMoreItems();
  }
  
  ngAfterViewInit(): void {
    if (this.isBrowser) {
      // Ensure the main content container takes full width
      this.setupLayout();
      
      // Also check after a small delay to handle any late DOM changes
      setTimeout(() => {
        this.setupLayout();
      }, 100);
    }
  }
  
  // Handle changes to input properties
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tagFilters']) {
      console.log('Tag filters changed:', this.tagFilters);
      this.applyFilters();
    }
  }
  
  // Apply tag filters to the loaded items
  private applyFilters(): void {
    if (!this.tagFilters || this.tagFilters.length === 0) {
      // If no filters, show all loaded items
      this.displayedItems = [...this.allLoadedItems];
    } else {
      // Filter items that contain ALL of the selected tags
      this.displayedItems = this.allLoadedItems.filter(item => {
        return this.tagFilters.every(tag => item.tags.includes(tag));
      });
    }
    
    // If we have few items after filtering, load more
    if (this.displayedItems.length < this.pageSize && !this.allLoaded) {
      this.loadMoreItems();
    }
  }
  
  // Get category color for the background
  getCategoryColor(category: string): string {
    const colors: {[key: string]: string} = {
      'Characters': '#7E57C2', // purple
      'Maps': '#26A69A',       // teal
      'Items': '#FFA000',      // amber
      'Monsters': '#EF5350',   // red
      'Spells': '#42A5F5',     // blue
      'Locations': '#66BB6A'   // green
    };
    
    return colors[category] || '#9E9E9E'; // default to gray
  }
  
  // Handle scroll events for infinite scrolling
  @HostListener('window:scroll')
  onScroll(): void {
    if (this.loading || this.allLoaded) return;
    
    // Check if we're near the bottom of the page
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollBottom = scrollTop + windowHeight;
    
    // If we're within 300px of the bottom, load more items
    if (scrollBottom >= documentHeight - 300) {
      this.loadMoreItems();
    }
  }
  
  // Load more items for infinite scroll
  loadMoreItems(): void {
    if (this.loading || this.allLoaded) return;
    
    this.loading = true;
    console.log(`Loading more items - Page: ${this.page}, Offset: ${this.page * this.pageSize}`);
    
    // Calculate offset based on current page
    const offset = this.page * this.pageSize;
    
    // Use the service
    this.pinService.getPins(this.pageSize, offset).subscribe({
      next: (pins: Pin[]) => {
        console.log(`Received ${pins.length} pins from service`);
        
        // Check if we've loaded all items
        if (pins.length < this.pageSize || offset + pins.length >= this.totalItemCount) {
          console.log('All items loaded');
          this.allLoaded = true;
        }
        
        // Add new pins to all loaded items
        this.allLoadedItems = [...this.allLoadedItems, ...pins];
        
        // Apply current filters
        this.applyFilters();
        
        this.page++;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading pins:', err);
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
  
  private setupLayout(): void {
    // Debug layout structure to help identify constraints
    this.debugLayoutStructure();
    
    // Ensure this component takes full width
    const mainContentElement = document.querySelector('app-main-content') as HTMLElement;
    if (mainContentElement) {
      mainContentElement.style.width = '100%';
      mainContentElement.style.maxWidth = '100%';
    }
    
    // Also set any child containers to full width
    const contentContainer = document.querySelector('.main-content-container') as HTMLElement;
    if (contentContainer) {
      contentContainer.style.width = '100%';
      contentContainer.style.maxWidth = '100%';
    }
  }
  
  private debugLayoutStructure(): void {
    console.log('Main content container width:', 
      (document.querySelector('.main-content-container') as HTMLElement)?.offsetWidth);
  }
}