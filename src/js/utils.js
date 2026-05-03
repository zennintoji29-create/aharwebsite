export // 1. UTILS
        const throttle = (fn, wait = 16) => {
            let timeout = null;
            return function(...args) {
                if (!timeout) {
                    timeout = setTimeout(() => {
                        fn.apply(this, args);
                        timeout = null;
                    }, wait);
                }
            };
        };
