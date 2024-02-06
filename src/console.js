const ConsoleTypes = {
    info: 'info',
    error: 'error',
};


const ConsoleStyles = {
    reset: '\x1b[0m',
    [ConsoleTypes.info]: {
        fg: '\x1b[34m',
        bg: '\x1b[44m\x1b[37m',
    },
    [ConsoleTypes.error]: {
        fg: '\x1b[31m',
        bg: '\x1b[41m\x1b[37m',
    },
};

const OutputMessages = {
    [ConsoleTypes.info]: '',
    [ConsoleTypes.error]: ''
};

export const prettyConsole = (() => {
    const handlerOutput = (trigger, message) => {
        const consoleType = [ConsoleStyles[trigger].bg, `${trigger.toUpperCase()}:`, ConsoleStyles.reset];
        const consoleOutput = [ConsoleStyles[trigger].fg, OutputMessages[trigger] + " " + message, ConsoleStyles.reset];

        console[trigger](...consoleType, ...consoleOutput);
    };

    return {
        info: (...message) => handlerOutput(ConsoleTypes.info, message),
        error: (...message) => handlerOutput(ConsoleTypes.error, message),
    };
})();