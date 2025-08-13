Issues.
1. Material switches are yellow
2. Under "Two-way binding", Rotation dropdown still does not work
3. "Auto Actions (execute on load) -> Download on load, Print on load, show last page" etc still not working when I click "Test auto actions" after flipping them on. This could be because only an iframe refresh happens on "Test auto actions". A full reload of the ng2-pdfjs-viewer component is required for a correct auto-actions test


Let's brainstorm. Currently, only a few show/hide options and a spinner are available to customize the viewer.

I like to add the following. Does these add value to the user? Also see if we can support other features without compromising upgradability - give me your ideas
1. Take a custom spinner from user
2. Add more show/hide to other buttons
3. Allow show/hide of Toolbar and Sidebar Groups
4. Ability to remove 
4. Theme & Visual Customization like below
@Input() theme: 'light'|'dark'|'auto';
@Input() bgColor?: string;
@Input() pageBackgroundColor?: string;

