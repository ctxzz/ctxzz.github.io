# Future: Migrate to HugoBlox Schema 2.0

## Overview
This issue tracks the future migration of the HugoBlox Academic CV theme configuration to Schema 2.0 format.

## Background
An attempt was made to migrate to Schema 2.0 (see PR #[number]), but the current kit module versions have compatibility issues that prevent proper rendering of author information and Japanese text.

## Current State
- **Configuration Format**: Schema 1.x (working)
- **Modules**: hugo-blox-builder v0.10.0
- **Status**: ✅ All features working correctly

## Target State
- **Configuration Format**: Schema 2.0 per `hugoblox.com/schema/v2`
- **Modules**: HugoBlox kit modules
  - `github.com/HugoBlox/kit/modules/integrations/netlify`
  - `github.com/HugoBlox/kit/modules/blox`
  - `github.com/HugoBlox/kit/modules/slides`

## Known Issues with Current Kit Modules

When using kit modules version `v0.0.0-20260106201334-85307a809791`:

1. **Author Name Display Bug**
   - Biography section displays "admin" (directory name) instead of "Atsushi Omata"
   - Issue: Theme reads author folder name instead of `title` field from `content/authors/admin/_index.md`
   
2. **Japanese Text Encoding**
   - Japanese author names may display as URL-encoded characters
   - Example: `%E4%B8%8A%E5%B3%B6` instead of "上島"

3. **Experience Page**
   - Information may not display correctly

## Reference Implementation

The official HugoBlox Academic CV template is available at:
https://github.com/HugoBlox/hugo-theme-academic-cv

Configuration files to reference:
- `config/_default/params.yaml` - Schema 2.0 format
- `config/_default/module.yaml` - Kit module paths
- `go.mod` - Module dependencies
- `hugoblox.yaml` - Build configuration

## Migration Steps (When Ready)

1. **Monitor kit module releases** for bug fixes related to author rendering
2. **Test with latest kit modules**:
   ```bash
   hugo mod get -u
   hugo mod tidy
   ```
3. **Update configuration files** following official template
4. **Verify all features work**:
   - Author name displays correctly ("Atsushi Omata" not "admin")
   - Japanese text renders properly
   - Publications display with correct author attribution
   - Experience page shows all information
5. **Run full build test**
6. **Compare output** with current working version

## Success Criteria

- ✅ Author name displays as "Atsushi Omata" throughout the site
- ✅ Japanese text displays correctly (not URL-encoded)
- ✅ All publication author names display properly
- ✅ Experience page shows all information correctly
- ✅ All existing features preserved (cyan theme, Gravatar, search, etc.)
- ✅ Build completes successfully with no errors
- ✅ Output is identical or better than current version

## Timeline

**Wait for**: HugoBlox kit modules to release stable versions with fixes for the author rendering bug.

**Monitor**: 
- HugoBlox kit module releases
- Academic CV template updates
- Community reports of successful migrations

## Notes

- The Schema 2.0 format itself is correct
- The configuration matching the official template exactly
- The issue is in the kit module implementation, not our configuration
- Do not attempt migration until kit modules are confirmed to be stable

## Related

- Official Template: https://github.com/HugoBlox/hugo-theme-academic-cv
- Schema Documentation: https://hugoblox.com/schema/v2
- Previous Migration Attempt: PR #[number]
