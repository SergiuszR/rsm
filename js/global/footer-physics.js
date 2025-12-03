(function() {
  'use strict';
  
  // Track multiple physics instances
  let physicsInstances = new Map();
  const VISIBILITY_OFFSET = 40;

  function createFullVisibilityObserver(options = {}) {
    if (window.RSMVisibility?.createFullVisibilityObserver) {
      return window.RSMVisibility.createFullVisibilityObserver(options);
    }
    return createFallbackVisibilityObserver(options);
  }

  function createFallbackVisibilityObserver(options = {}) {
    if (typeof IntersectionObserver === 'undefined') {
      return {
        observe(element) {
          if (element && typeof options.onEnter === 'function') {
            options.onEnter(element, { fallback: true });
          }
        },
        unobserve() {},
        disconnect() {}
      };
    }

    const {
      offset = VISIBILITY_OFFSET,
      once = false,
      onEnter,
      onLeave,
      thresholdStep = 0.25
    } = options;

    function buildThresholds(step) {
      const thresholds = [];
      const increment = step && step > 0 ? step : 0.25;
      for (let i = 0; i <= 1; i += increment) {
        thresholds.push(Number(i.toFixed(2)));
      }
      if (thresholds[thresholds.length - 1] !== 1) thresholds.push(1);
      return thresholds;
    }

    const thresholds = buildThresholds(thresholdStep);
    const state = new WeakMap();
    const pendingChecks = new WeakMap();
    let observer;

    function cancelPending(target) {
      const rafId = pendingChecks.get(target);
      if (rafId) {
        cancelAnimationFrame(rafId);
        pendingChecks.delete(target);
      }
    }

    function scheduleCheck(target, meta) {
      if (!target || !document.body.contains(target)) return;

      const evaluate = () => {
        const rect = target.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement?.clientHeight || 0;
        const safeOffset = Math.max(0, Number(offset) || 0);
        const fitsViewport = rect.height + safeOffset * 2 <= viewportHeight;
        const fullyVisible = viewportHeight ?
          (fitsViewport ? (rect.top >= safeOffset && rect.bottom <= viewportHeight - safeOffset) : rect.top >= safeOffset)
          : false;

        if (fullyVisible) {
          cancelPending(target);
          if (state.get(target) === true) return;
          state.set(target, true);
          if (typeof onEnter === 'function') {
            onEnter(target, { entry: meta?.entry, rect, viewportHeight });
          }
          if (once && observer) {
            observer.unobserve(target);
            state.delete(target);
          }
        } else if (document.body.contains(target)) {
          const rafId = requestAnimationFrame(evaluate);
          pendingChecks.set(target, rafId);
        }
      };

      cancelPending(target);
      const rafId = requestAnimationFrame(evaluate);
      pendingChecks.set(target, rafId);
    }

    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const target = entry.target;
        const wasVisible = state.get(target) === true;

        if (entry.isIntersecting) {
          if (!wasVisible && !pendingChecks.has(target)) {
            scheduleCheck(target, { entry });
          }
        } else {
          cancelPending(target);
          if (wasVisible) {
            state.set(target, false);
            if (!once && typeof onLeave === 'function') {
              onLeave(target, { entry });
            }
          }
        }
      });
    }, { threshold: thresholds });

    return {
      observe(element) {
        if (element) observer.observe(element);
      },
      unobserve(element) {
        if (element) {
          cancelPending(element);
          observer.unobserve(element);
        }
      },
      disconnect() {
        observer.disconnect();
      }
    };
  }
  
  function initPhysicsSystem() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initPhysicsSystem);
      return;
    }
    
    function waitAndInit() {
      if (window.AnimationManager && typeof window.AnimationManager.onReady === 'function') {
        window.AnimationManager.onReady(function() {
          if (!window.gsap || !window.Matter) return;
          initPhysicsTriggers();
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
            /* AnimationManager not available for footer-physics */
          }
        }, 50);
      }
    }
    
    waitAndInit();
  }

  function initPhysicsTriggers() {
    const physicsElements = document.querySelectorAll('[data-physics]');
    if (physicsElements.length === 0) return;

    const visibilityCallbacks = new WeakMap();
    const visibilityObserver = createFullVisibilityObserver({
      offset: VISIBILITY_OFFSET,
      once: true,
      onEnter: (target) => {
        const cb = visibilityCallbacks.get(target);
        if (typeof cb === 'function') {
          cb();
          visibilityCallbacks.delete(target);
        }
      }
    });
    
    // Hide icons immediately
    physicsElements.forEach((element) => {
      let wrapper = element.classList.contains('physics_wrapper') ? element : element.querySelector('.physics_wrapper');
      if (wrapper) {
        const icons = wrapper.querySelectorAll('.physics_icon');
        icons.forEach(icon => {
          icon.style.opacity = '0';
          icon.style.visibility = 'hidden';
        });
      }
    });
    
    // Wait for page to settle before creating triggers
    function createTriggers() {
      physicsElements.forEach((element, index) => {
        let wrapper = element.classList.contains('physics_wrapper') ? element : element.querySelector('.physics_wrapper');
        if (!wrapper) return;
        
        const instanceId = `physics-${index}`;
        
        function triggerPhysics() {
          if (!physicsInstances.has(instanceId)) {
            const instance = initPhysics(wrapper);
            if (instance) {
              dropIcons(wrapper, instance);
              physicsInstances.set(instanceId, instance);
            }
          }
        }
        
        visibilityCallbacks.set(element, triggerPhysics);
        visibilityObserver.observe(element);
      });
    }
    
    // Wait for window load + extra time for layout to settle
    if (document.readyState === 'complete') {
      setTimeout(createTriggers, 500);
    } else {
      window.addEventListener('load', () => setTimeout(createTriggers, 500));
    }
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
      return;
    }
    
    const wrapperHeight = wrapper.offsetHeight;
    const wrapperWidth = wrapper.offsetWidth;
    
    icons.forEach((icon, index) => {
      // Safety check for icon element
      if (!icon || !icon.offsetWidth || !icon.offsetHeight) {
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
            return; // Safety check
          }
          
          const { element, body } = bodyData;
          
          // Additional safety checks
          if (!element || !body || !body.position) {
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
          /* animation loop halted */
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
