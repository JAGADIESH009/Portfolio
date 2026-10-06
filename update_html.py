import sys

with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

out = []
skip = False
for i, line in enumerate(lines):
    if 'SELECTED WORK SECTION' in line:
        skip = True
        # Add the new WHAT I BUILT section
        out.append('  <!-- ==========================================================================\n')
        out.append('       WHAT I BUILT SECTION (WORKS WHEELS)\n')
        out.append('       ========================================================================== -->\n')
        out.append('  <section class="works-editorial section" id="works">\n')
        out.append('    <div class="works-main-title">WHAT I BUILT</div>\n\n')
        out.append('    <div class="works-wheels-wrapper">\n')
        out.append('      <!-- Websites Wheel Container -->\n')
        out.append('      <div id="wheel-websites"></div>\n')
        out.append('      \n')
        out.append('      <!-- Projects Wheel Container -->\n')
        out.append('      <div id="wheel-projects"></div>\n')
        out.append('    </div>\n')
        out.append('  </section>\n\n')
        
    if 'CONTACT SECTION' in line:
        skip = False
        out.append('  <!-- ==========================================================================\n')

    if not skip:
        # Script updates
        if '<script src="data/projects.js"></script>' in line:
            line = '  <script src="js/works-wheel.js"></script>\n  <script src="js/works-init.js"></script>\n'
        if '<script src="js/projects.js' in line:
            continue
            
        # Nav links update
        if '<a href="#projects">WORK</a>' in line:
            line = line.replace('#projects', '#works').replace('WORK', 'WHAT I BUILT')
        if '<a href="#websites">WEBSITES</a>' in line:
            continue
            
        # For the mobile menu
        if '<a href="#websites" class="mobile-link">WEBSITES</a>' in line:
            continue
        if '<a href="#projects" class="mobile-link">WORK</a>' in line:
            line = line.replace('#projects', '#works').replace('WORK', 'WHAT I BUILT')
            
        out.append(line)

# Let's remove the stray comment line before the newly inserted one if it exists
clean_out = []
for i, line in enumerate(out):
    if line.strip() == '<!-- ==========================================================================':
        if i + 1 < len(out) and 'WHAT I BUILT SECTION (WORKS WHEELS)' in out[i+1]:
            # we check if the line BEFORE was also a start comment
            if i > 0 and clean_out[-1].strip() == '<!-- ==========================================================================':
                clean_out.pop()
    clean_out.append(line)

with open('index.html', 'w', encoding='utf-8') as f:
    f.writelines(clean_out)

print("index.html updated successfully.")
