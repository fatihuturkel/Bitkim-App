/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

export const Colors = {
  light: {

    label: '#000000',         // iOS Primary Label
    secondaryLabel: '#3C3C43', // iOS Secondary Label
    tertiaryLabel: '#8E8E93', // iOS Tertiary Label
    quaternaryLabel: '#D1D1D6', // iOS Quaternary Label
    placeholderText: '#8E8E93', // iOS Placeholder Text
    separator: '#C6C6C8',     // iOS Separator
    opaqueSeparator: '#BCBCBE', // iOS Opaque Separator
    link: '#007AFF',         // iOS Link
    systemBlue: '#007AFF',   // iOS System Blue
    systemGray: '#8E8E93',   // iOS System Gray
    systemGray2: '#AEAEB2',  // iOS System Gray 2
    systemGray3: '#C7C7CC',  // iOS System Gray 3
    systemGray4: '#D1D1D6',  // iOS System Gray 4
    systemGray5: '#E5E5EA',  // iOS System Gray 5
    systemGray6: '#F2F2F7',  // iOS System Gray 6
    systemRed: '#FF3B30',    // iOS System Red
    systemGreen: '#34C759',  // iOS System Green (Updated)
    systemOrange: '#FF9500', // iOS System Orange
    systemPink: '#FF2D55',   // iOS System Pink
    systemPurple: '#AF52DE', // iOS System Purple
    systemTeal: '#30B0C7',   // iOS System Teal (Updated)
    systemYellow: '#FFCC00', // iOS System Yellow
    systemIndigo: '#5856D6', // iOS System Indigo
    systemBrown: '#A5845E',  // iOS System Brown (Updated)
    systemCyan: '#32ADE6',   // iOS System Cyan (Updated)
    systemMagenta: '#FF00FF', // iOS System Magenta (No image provided)

    systemBackground: '#FFFFFF', // iOS Primary Background
    secondarySystemBackground: '#F2F2F7', // iOS Secondary Background
    tertiarySystemBackground: '#E5E5EA', // iOS Tertiary Background (Matches systemGray5 Light)

    tint: '#007AFF', // iOS Tint Color (Primary Color)

    // --------- User Defined Colors ---------
    mixSystemBackground: '#F2F2F7',
    mixListItemBackground: '#FFFFFF',
  },
  dark: {

    label: '#FFFFFF',         // iOS Primary Label
    secondaryLabel: '#EBEBF5', // iOS Secondary Label
    tertiaryLabel: '#C7C7CC', // iOS Tertiary Label
    quaternaryLabel: '#ABABAB', // iOS Quaternary Label
    placeholderText: '#C7C7CC', // iOS Placeholder Text
    separator: '#38383A',     // iOS Separator
    opaqueSeparator: '#48484A', // iOS Opaque Separator
    link: '#0A84FF',         // iOS Link
    systemBlue: '#0A84FF',   // iOS System Blue
    systemGray: '#8E8E93',   // iOS System Gray
    systemGray2: '#636366',  // iOS System Gray 2
    systemGray3: '#48484A',  // iOS System Gray 3
    systemGray4: '#3A3A3C',  // iOS System Gray 4
    systemGray5: '#2C2C2E',  // iOS System Gray 5
    systemGray6: '#1C1C1E',  // iOS System Gray 6
    systemRed: '#FF453A',    // iOS System Red (Updated)
    systemGreen: '#30D158',  // iOS System Green (Updated)
    systemOrange: '#FF9F0A', // iOS System Orange (Updated)
    systemPink: '#FF3760',   // iOS System Pink (Updated)
    systemPurple: '#BF5AF2', // iOS System Purple (Updated)
    systemTeal: '#40C8E0',   // iOS System Teal (Updated)
    systemYellow: '#FFD60A', // iOS System Yellow (Updated)
    systemIndigo: '#5E5CE6', // iOS System Indigo (Updated)
    systemBrown: '#AC8E68',  // iOS System Brown (Updated)
    systemCyan: '#64D2FF',   // iOS System Cyan (Updated)
    systemMagenta: '#FF00FF', // iOS System Magenta (No image provided)

    systemBackground: '#000000', // iOS Primary Background
    secondarySystemBackground: '#1C1C1E', // iOS Secondary Background
    tertiarySystemBackground: '#2C2C2E', // iOS Tertiary Background (Matches systemGray5 Dark)

    tint: '#0A84FF', // iOS Tint Color (Primary Color)

    // --------- User Defined Colors ---------
    mixSystemBackground: '#000000',
    mixListItemBackground: '#1C1C1E',
  },
};

/*
 * ============================================================================
 * iOS System Color Reference (for context and potential future use)
 * Source: Apple Human Interface Guidelines & common observations
 * Values updated based on provided images where applicable.
 * ============================================================================
 *
 * --- Background Colors ---
 *
 * systemBackground: The primary background for content.
 *   - Light: #FFFFFF (White)
 *   - Dark:  #000000 (Black)
 *
 * secondarySystemBackground: For grouped content or elements on top of the main background. (Matches systemGray6)
 *   - Light: #F2F2F7
 *   - Dark:  #1C1C1E
 *
 * tertiarySystemBackground: For elements layered on secondary backgrounds. (Matches systemGray5)
 *   - Light: #E5E5EA
 *   - Dark:  #2C2C2E
 *
 * --- Label Colors ---
 *
 * label: Primary text color.
 *   - Light: #000000 (Black)
 *   - Dark:  #FFFFFF (White)
 *
 * secondaryLabel: Less prominent text.
 *   - Light: #3C3C43 (Dark Gray)
 *   - Dark:  #EBEBF5 (Very Light Gray)
 *
 * tertiaryLabel: Even less prominent text (e.g., captions). (Matches systemGray Light / systemGray3 Light)
 *   - Light: #8E8E93
 *   - Dark:  #C7C7CC
 *
 * quaternaryLabel: Least prominent text. (Matches systemGray4 Light / ?)
 *   - Light: #D1D1D6
 *   - Dark:  #ABABAB
 *
 * --- Other Colors ---
 *
 * placeholderText: Color for placeholder text in controls. (Matches tertiaryLabel)
 *   - Light: #8E8E93
 *   - Dark:  #C7C7CC
 *
 * separator: Color for separators (often semi-transparent). Opaque values below.
 *   - Light: #C6C6C8
 *   - Dark:  #38383A
 *
 * opaqueSeparator: Fully opaque separator color. (Matches ? / systemGray3 Dark)
 *   - Light: #BCBCBE
 *   - Dark:  #48484A
 *
 * link: Color for hyperlinks. (Matches systemBlue)
 *   - Light: #007AFF
 *   - Dark:  #0A84FF
 *
 * systemBlue: The standard system blue tint color.
 *   - Light: #007AFF
 *   - Dark:  #0A84FF
 *
 * systemRed: A standard red color.
 *   - Light: #FF3B30
 *   - Dark:  #FF453A
 *
 * systemOrange: A standard orange color.
 *   - Light: #FF9500
 *   - Dark:  #FF9F0A
 *
 * systemYellow: A standard yellow color.
 *  - Light: #FFCC00
 *  - Dark:  #FFD60A
 *
 * systemPink: A standard pink color.
 *   - Light: #FF2D55
 *   - Dark:  #FF3760
 *
 * systemGreen: A standard green color.
 *   - Light: #34C759
 *   - Dark:  #30D158
 *
 * systemPurple: A standard purple color.
 *   - Light: #AF52DE
 *   - Dark:  #BF5AF2
 *
 * systemTeal: A standard teal color.
 *   - Light: #30B0C7
 *   - Dark:  #40C8E0
 *
 * systemIndigo: A standard indigo color.
 *   - Light: #5856D6
 *   - Dark:  #5E5CE6
 *
 * systemBrown: A standard brown color.
 *   - Light: #A5845E
 *   - Dark:  #AC8E68
 *
 * systemCyan: A standard cyan color.
 *   - Light: #32ADE6
 *   - Dark:  #64D2FF
 *
 * systemGray: A neutral gray.
 *   - Light: #8E8E93
 *   - Dark:  #8E8E93
 *
 * systemGray2:
 *  - Light: #AEAEB2
 *  - Dark:  #636366
 *
 * systemGray3:
 *  - Light: #C7C7CC
 *  - Dark:  #48484A
 *
 * systemGray4:
 *  - Light: #D1D1D6
 *  - Dark:  #3A3A3C
 *
 * systemGray5:
 *  - Light: #E5E5EA
 *  - Dark:  #2C2C2E
 *
 * systemGray6:
 *  - Light: #F2F2F7
 *  - Dark:  #1C1C1E
 */


