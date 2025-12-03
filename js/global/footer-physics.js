(function() {
  'use strict';
  
  // Track multiple physics instances
  let physicsInstances = new Map();
  
  function initPhysicsSystem() {
    // Ensure DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initPhysicsSystem);
      return;
    }
    
    // Wait for AnimationManager and GSAP
    function waitAndInit() {
      if (window.AnimationManager && typeof window.AnimationManager.onReady === 'function') {
        window.AnimationManager.onReady(function() {
          if (!window.gsap || !window.ScrollTrigger) {
            console.warn('GSAP or ScrollTrigger not loaded for footer-physics');
            return;
          }
          gsap.registerPlugin(ScrollTrigger);
          initScrollTrigger();
          
          // Safari needs a refresh after ScrollTriggers are created
          setTimeout(function() {
            if (window.ScrollTrigger) {
              try { ScrollTrigger.refresh(); } catch (e) {}
            }
          }, 100);
        });
      } else {
        // Polling fallback
        let attempts = 0;
        const maxAttempts = 100;
        const timer = setInterval(function() {
          attempts++;
          if (window.AnimationManager && typeof window.AnimationManager.onReady === 'function') {
            clearInterval(timer);
            waitAndInit();
          } else if (attempts >= maxAttempts) {
            clearInterval(timer);
            console.error('AnimationManager not loaded for footer-physics');
          }
        }, 50);
      }
    }
    
    waitAndInit();
  }

  function initScrollTrigger() {
    const physicsElements = document.querySelectorAll('[data-physics]');
    
    if (physicsElements.length === 0) {
      console.error('No [data-physics] elements found');
      return;
    }

    physicsElements.forEach((element, index) => {
      // Check if the [data-physics] element itself has the physics_wrapper class
      let wrapper = null;
      if (element.classList.contains('physics_wrapper')) {
        wrapper = element;
      } else {
        wrapper = element.querySelector('.physics_wrapper');
      }
      
      if (!wrapper) {
        console.error('Physics wrapper not found - [data-physics] element should either be .physics_wrapper or contain .physics_wrapper');
        return;
      }
      
      // Hide all icons initially to prevent flash of unstyled content
      const icons = wrapper.querySelectorAll('.physics_icon');
      icons.forEach(icon => {
        icon.style.opacity = '0';
        icon.style.visibility = 'hidden';
      });
      
      // Start physics earlier for smoother experience
      const triggerValue = 20; // Start when element is 20% visible
      
      
      const instanceId = `physics-${index}`;
      
      ScrollTrigger.create({
        trigger: element,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          // Check if element has reached threshold
          const visibility = Math.round(self.progress * 100);
          if (visibility >= triggerValue && !physicsInstances.has(instanceId)) {
            const instance = initPhysics(wrapper);
            if (instance) {
              dropIcons(wrapper, instance);
              physicsInstances.set(instanceId, instance);
            }
          }
        }
      });
    });
  }

  function initPhysics(wrapper) {
    if (!wrapper) return null;

    const engine = Matter.Engine.create();
    const world = engine.world;
    engine.world.gravity.y = 1; // Slightly stronger gravity for better bounce
    
    const wrapperWidth = wrapper.offsetWidth;
    const wrapperHeight = wrapper.offsetHeight;
    
    // Create bouncy ground
    const ground = Matter.Bodies.rectangle(
      wrapperWidth / 2,           
      wrapperHeight - 5,          // Thinner ground for better bounce
      wrapperWidth, 
      10, 
      { 
        isStatic: true,
        restitution: 0.9 // Make ground bouncy too
      }
    );
    
    const leftWall = Matter.Bodies.rectangle(
      5, 
      wrapperHeight / 2, 
      10, 
      wrapperHeight, 
      { 
        isStatic: true,
        restitution: 0.8
      }
    );
    
    const rightWall = Matter.Bodies.rectangle(
      wrapperWidth - 5, 
      wrapperHeight / 2, 
      10, 
      wrapperHeight, 
      { 
        isStatic: true,
        restitution: 0.8
      }
    );
    
    Matter.World.add(world, [ground, leftWall, rightWall]);
    // Use Runner API (Engine.run is deprecated)
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);
    
    return {
      engine,
      world,
      runner,
      bodies: []
    };
  }

  function dropIcons(wrapper, instance) {
    const icons = wrapper.querySelectorAll('.physics_icon');
    
    if (!wrapper || icons.length === 0) {
      console.error('Wrapper or icons not found');
      return;
    }
    
    const wrapperHeight = wrapper.offsetHeight;
    const wrapperWidth = wrapper.offsetWidth;
    
    icons.forEach((icon, index) => {
      // Safety check for icon element
      if (!icon || !icon.offsetWidth || !icon.offsetHeight) {
        console.warn(`Skipping invalid icon at index ${index}`);
        return;
      }
      
      const randomX = Math.random() * Math.max(0, wrapperWidth - icon.offsetWidth);
      
      icon.style.left = `${randomX}px`;
      icon.style.top = `${-100 - (index * 50)}px`;
      icon.style.visibility = 'visible'; // Make visible before animating
      
      const body = Matter.Bodies.rectangle(
        randomX + icon.offsetWidth / 2,
        -100 - (index * 50),
        icon.offsetWidth,
        icon.offsetHeight,
        {
          restitution: 0.8,    // Higher bounce
          friction: 0.4,       // Less friction for more bounce
          frictionAir: 0.01,   // Less air friction
          density: 0.001       // Lighter for more bounce
        }
      );
      
      instance.bodies.push({ element: icon, body: body });
      Matter.World.add(instance.world, body);
      addImprovedDragInteraction(icon, body, wrapper, instance);
      
      // Smooth fade-in animation with stagger
      gsap.to(icon, {
        opacity: 1,
        duration: 0.6,
        delay: index * 0.1, // Stagger effect
        ease: "power2.out"
      });
    });
    
    // Animation loop for this specific instance
    function animate() {
      try {
        if (!wrapper || !wrapper.isConnected) return; // Stop if wrapper is removed from DOM
        if (!instance || !instance.bodies || !Array.isArray(instance.bodies)) return; // Safety check
        if (instance.bodies.length === 0) return; // No bodies to animate
        
        const wrapperHeight = wrapper.offsetHeight;
        const wrapperWidth = wrapper.offsetWidth;
        
        instance.bodies.forEach((bodyData, index) => {
          if (!bodyData || !bodyData.element || !bodyData.body) {
            console.warn(`Invalid body data at index ${index}, skipping`);
            return; // Safety check
          }
          
          const { element, body } = bodyData;
          
          // Additional safety checks
          if (!element || !body || !body.position) {
            console.warn(`Invalid element or body at index ${index}, skipping`);
            return;
          }
          
          let x = body.position.x - element.offsetWidth / 2;
          let y = body.position.y - element.offsetHeight / 2;
          
          // Soft constraints (allow slight overflow for bounce effect)
          x = Math.max(-10, Math.min(x, wrapperWidth - element.offsetWidth + 10));
          y = Math.max(-50, Math.min(y, wrapperHeight - element.offsetHeight + 5));
          
          element.style.left = `${x}px`;
          element.style.top = `${y}px`;
          element.style.transform = `rotate(${body.angle}rad)`;
        });
        requestAnimationFrame(animate);
      } catch (error) {
        console.error('Animation loop error:', error);
        // Stop the animation loop on error
      }
    }
    animate();
  }

  function addImprovedDragInteraction(element, body, wrapper, instance) {
    let isDragging = false;
    let mouseConstraint = null;
    let dragOffset = { x: 0, y: 0 };
    
    // Add visual feedback
    element.style.cursor = 'grab';
    element.style.transition = 'transform 0.1s ease';
    
    element.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isDragging = true;
      element.style.cursor = 'grabbing';
      element.style.transform += ' scale(1.1)'; // Visual feedback
      
      // Calculate offset from element center
      const wrapperRect = wrapper.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      
      dragOffset.x = e.clientX - (elementRect.left + elementRect.width / 2);
      dragOffset.y = e.clientY - (elementRect.top + elementRect.height / 2);
      
      // Create stronger mouse constraint
      const relativeX = e.clientX - wrapperRect.left;
      const relativeY = e.clientY - wrapperRect.top;
      
      mouseConstraint = Matter.Constraint.create({
        bodyA: body,
        pointB: { x: relativeX, y: relativeY },
        stiffness: 0.9,      // Stronger connection
        damping: 0.05,       // Less damping for more responsive feel
        length: 0            // No slack in constraint
      });
      
      Matter.World.add(instance.world, mouseConstraint);
      
      // Reduce physics temporarily while dragging
      body.frictionAir = 0.1;
    });
    
    document.addEventListener('mousemove', (e) => {
      if (isDragging && mouseConstraint) {
        const wrapperRect = wrapper.getBoundingClientRect();
        
        // Use the drag offset for more natural feel
        const relativeX = e.clientX - wrapperRect.left - dragOffset.x;
        const relativeY = e.clientY - wrapperRect.top - dragOffset.y;
        
        mouseConstraint.pointB = { x: relativeX, y: relativeY };
      }
    });
    
    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        element.style.cursor = 'grab';
        element.style.transform = element.style.transform.replace(' scale(1.1)', ''); // Remove scale
        
        if (mouseConstraint) {
          Matter.World.remove(instance.world, mouseConstraint);
          mouseConstraint = null;
        }
        
        // Restore physics properties
        body.frictionAir = 0.01;
        
        // Add a little impulse for fun when released
        const randomImpulse = {
          x: (Math.random() - 0.5) * 0.01,
          y: (Math.random() - 0.5) * 0.01
        };
        Matter.Body.applyForce(body, body.position, randomImpulse);
      }
    });
    
    // Handle mouse leave to prevent stuck dragging
    document.addEventListener('mouseleave', () => {
      if (isDragging) {
        isDragging = false;
        element.style.cursor = 'grab';
        element.style.transform = element.style.transform.replace(' scale(1.1)', '');
        
        if (mouseConstraint) {
          Matter.World.remove(instance.world, mouseConstraint);
          mouseConstraint = null;
        }
        
        body.frictionAir = 0.01;
      }
    });
    
    // Add hover effects
    element.addEventListener('mouseenter', () => {
      if (!isDragging) {
        element.style.transform += ' scale(1.05)';
      }
    });
    
    element.addEventListener('mouseleave', () => {
      if (!isDragging) {
        element.style.transform = element.style.transform.replace(' scale(1.05)', '');
      }
    });
  }
  
  // Start initialization
  initPhysicsSystem();
})();
