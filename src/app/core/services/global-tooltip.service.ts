import { Injectable, NgZone, OnDestroy } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalTooltipService implements OnDestroy {
  private tooltipElement: HTMLElement | null = null;
  private currentTarget: HTMLElement | null = null;

  // Bound listeners
  private boundOnMouseOver = this.onMouseOver.bind(this);
  private boundOnMouseOut = this.onMouseOut.bind(this);
  private boundHideTooltip = this.hideTooltip.bind(this);

  constructor(private ngZone: NgZone) {
    this.init();
  }

  private init() {
    // We run all of this entirely outside Angular's change detection zone.
    // This provides a MASSIVE performance boost because thousands of inputs won't
    // trigger Angular change detection loops on every mouse movement, hover, or scroll.
    this.ngZone.runOutsideAngular(() => {
      document.addEventListener('mouseover', this.boundOnMouseOver);
      document.addEventListener('mouseout', this.boundOnMouseOut);
      document.addEventListener('focusin', this.boundHideTooltip);
      document.addEventListener('input', this.boundHideTooltip);
      
      // Use capture phase (true) to catch all scroll events even from inner divs
      window.addEventListener('scroll', this.boundHideTooltip, true);
    });
  }

  private onMouseOver(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target) return;

    // Check if we hovered onto the tooltip itself (prevent flickering)
    if (this.tooltipElement && (target === this.tooltipElement || this.tooltipElement.contains(target))) {
      return;
    }

    let value = '';
    let hostElement: HTMLElement | null = null;

    // 1. Check if hovering over a standard input or textarea
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      const type = target.getAttribute('type');
      if (type !== 'checkbox' && type !== 'radio' && type !== 'submit' && type !== 'button' && type !== 'hidden') {
        value = (target as HTMLInputElement).value;
        hostElement = target;
      }
    } 
    // 2. Check if hovering over a PrimeNG dropdown (the closed select box itself)
    else if (target.closest('p-select, p-dropdown, p-multiselect')) {
      const parent = target.closest('p-select, p-dropdown, p-multiselect') as HTMLElement;
      const label = parent.querySelector('.p-select-label, .p-dropdown-label, .p-multiselect-label') as HTMLElement;
      if (label) {
        value = label.textContent || (label as HTMLElement).innerText || '';
        hostElement = parent;
      }
    }
    // 3. Check if hovering over a dropdown OPTION item inside the open list
    else if (target.closest('.p-select-item, .p-dropdown-item, .p-multiselect-item, p-selectitem, .p-listbox-item')) {
      const item = target.closest('.p-select-item, .p-dropdown-item, .p-multiselect-item, p-selectitem, .p-listbox-item') as HTMLElement;
      value = item.textContent || (item as HTMLElement).innerText || '';
      hostElement = item;
    }

    if (value && typeof value === 'string' && value.trim() !== '' && value.trim() !== 'empty' && hostElement) {
      // If we are already showing tooltip for THIS element, don't recreate
      if (this.currentTarget !== hostElement) {
        this.showTooltip(value.trim(), hostElement);
        this.currentTarget = hostElement;
      }
    }
  }

  private onMouseOut(event: MouseEvent) {
    const relatedTarget = event.relatedTarget as HTMLElement;
    
    // If we move from the host to the tooltip itself, keep it open
    if (this.tooltipElement && relatedTarget && (relatedTarget === this.tooltipElement || this.tooltipElement.contains(relatedTarget))) {
      return;
    }

    // Hide tooltip if we move out of the current target element
    if (this.currentTarget) {
      if (!relatedTarget || !this.currentTarget.contains(relatedTarget)) {
         this.hideTooltip();
      }
    }
  }

  private showTooltip(text: string, hostElement: HTMLElement) {
    this.hideTooltip(); // clear existing

    this.tooltipElement = document.createElement('div');
    this.tooltipElement.textContent = text;

    // Apply styles directly
    Object.assign(this.tooltipElement.style, {
      position: 'fixed',
      backgroundColor: '#000000',
      color: '#ffffff',
      padding: '6px 10px',
      borderRadius: '4px',
      fontSize: '12px',
      zIndex: '2147483647', // Maximum possible z-index to stay above everything
      pointerEvents: 'none',
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      maxWidth: '400px',
      lineHeight: '1.4'
    });

    document.body.appendChild(this.tooltipElement);

    const hostPos = hostElement.getBoundingClientRect();
    const tooltipPos = this.tooltipElement.getBoundingClientRect();
    
    // Position directly above the host element
    let top = hostPos.top - tooltipPos.height - 8;
    let left = hostPos.left;

    // Fallback below if not enough space above
    if (top < 0) {
      top = hostPos.bottom + 8;
    }
    
    // Prevent clipping on the right side of the screen
    if (left + tooltipPos.width > window.innerWidth) {
      left = window.innerWidth - tooltipPos.width - 8;
    }
    
    // Prevent clipping on the left side of the screen
    if (left < 8) {
      left = 8;
    }

    this.tooltipElement.style.top = `${top}px`;
    this.tooltipElement.style.left = `${left}px`;
  }

  private hideTooltip() {
    if (this.tooltipElement && this.tooltipElement.parentNode) {
      this.tooltipElement.parentNode.removeChild(this.tooltipElement);
    }
    this.tooltipElement = null;
    this.currentTarget = null;
  }

  ngOnDestroy() {
    this.hideTooltip();
    document.removeEventListener('mouseover', this.boundOnMouseOver);
    document.removeEventListener('mouseout', this.boundOnMouseOut);
    document.removeEventListener('focusin', this.boundHideTooltip);
    document.removeEventListener('input', this.boundHideTooltip);
    window.removeEventListener('scroll', this.boundHideTooltip, true);
  }
}
