<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fo="http://www.w3.org/1999/XSL/Format"
	xmlns:d="http://docbook.org/ns/docbook" version="1.0">
	<xsl:import href="urn:docbkx:stylesheet" />
	<xsl:import href="customtitlepage.xsl"/>
	<xsl:attribute-set name="root.properties">
		<xsl:attribute name="font-size">12pt</xsl:attribute>
		<xsl:attribute name="line-height">1.5</xsl:attribute>
	</xsl:attribute-set>
	<xsl:attribute-set name="revhistory.title.properties">
		<xsl:attribute name="font-size">12pt</xsl:attribute>
		<xsl:attribute name="font-weight">bold</xsl:attribute>
		<xsl:attribute name="text-align">center</xsl:attribute>
	</xsl:attribute-set>
	<xsl:attribute-set name="revhistory.table.properties">
		<xsl:attribute name="border">0.5pt solid black</xsl:attribute>
		<xsl:attribute name="background-color">#EEEEEE</xsl:attribute>
		<xsl:attribute name="width">89.3215%</xsl:attribute>
		<xsl:attribute name="float">start</xsl:attribute>
	</xsl:attribute-set>
	<xsl:attribute-set name="revhistory.table.cell.properties">
		<xsl:attribute name="border">0.5pt solid black</xsl:attribute>
		<xsl:attribute name="font-size">9pt</xsl:attribute>
		<xsl:attribute name="padding">4pt</xsl:attribute>
	</xsl:attribute-set>
	<xsl:attribute-set name="verbatim.properties">
		<xsl:attribute name="font-size">9pt</xsl:attribute>
		<xsl:attribute name="line-height">1</xsl:attribute>
	</xsl:attribute-set>
	<xsl:attribute-set name="monospace.verbatim.properties">
		<xsl:attribute name="wrap-option">wrap</xsl:attribute>
		<xsl:attribute name="hyphenation-character">\</xsl:attribute>
		<xsl:attribute name="keep-together.within-column">auto</xsl:attribute>
		<xsl:attribute name="width">95%</xsl:attribute>
	</xsl:attribute-set>
	<xsl:template name="hyperlink.url.display">
  <!-- * This template is called for all external hyperlinks (ulinks and -->
  <!-- * for all simple xlinks); it determines whether the URL for the -->
  <!-- * hyperlink is displayed, and how to display it (either inline or -->
  <!-- * as a numbered footnote). -->
		<xsl:param name="url" />
		<xsl:param name="ulink.url" />
		<!-- override the template and do nothing. -->
	</xsl:template>
	<xsl:template match="*" mode="simple.xlink.properties">
		<xsl:attribute name="color">blue</xsl:attribute>
		<xsl:attribute name="text-decoration">underline</xsl:attribute>
	</xsl:template>
	<xsl:template name="image.width">
		<xsl:variable name="scalefit">
			<xsl:call-template name="image.scalefit" />
		</xsl:variable>
		<xsl:choose>
			<xsl:when test="$ignore.image.scaling != 0">
				auto
			</xsl:when>
			<xsl:when test="$scalefit = 1">
				100%
			</xsl:when>
			<xsl:when test="contains(@width,'%')">
				<xsl:value-of select="@width" />
			</xsl:when>
			<xsl:when test="@width and not(@width = '')">
				<xsl:call-template name="length-spec">
					<xsl:with-param name="length" select="@width" />
					<xsl:with-param name="default.units" select="'px'" />
				</xsl:call-template>
			</xsl:when>
			<xsl:when test="not(@depth) and $default.image.width != ''">
				<xsl:call-template name="length-spec">
					<xsl:with-param name="length" select="$default.image.width" />
					<xsl:with-param name="default.units" select="'px'" />
				</xsl:call-template>
			</xsl:when>
			<xsl:otherwise>
				auto
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="image.content.height">
		<xsl:param name="scalefit" select="0" />
		<xsl:param name="scale" select="0" />
		<xsl:choose>
			<xsl:when test="$ignore.image.scaling != 0">
				auto
			</xsl:when>
			<xsl:when test="contains(@contentdepth,'%')">
				<xsl:value-of select="@contentdepth" />
			</xsl:when>
			<xsl:when test="@contentdepth">
				<xsl:call-template name="length-spec">
					<xsl:with-param name="length" select="@contentdepth" />
					<xsl:with-param name="default.units" select="'px'" />
				</xsl:call-template>
			</xsl:when>
			<xsl:when test="number($scale) != 1.0">
				<xsl:value-of select="$scale * 100" />
				<xsl:text>%</xsl:text>
			</xsl:when>
			<xsl:when test="$scalefit = 1">
				100%</xsl:when>
			<xsl:otherwise>
				auto
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	<xsl:template match="d:paramdef" mode="kr-funcsynopsis-mode" />
	<xsl:template name="initial.page.number">auto-odd</xsl:template>
	<xsl:template name="page.number.format">1</xsl:template>
	<xsl:template name="header.content">
		<xsl:param name="pageclass" select="''"/>
		<xsl:param name="sequence" select="''"/>
		<xsl:param name="position" select="''"/>
		<xsl:param name="gentext-key" select="''"/>
		<xsl:choose>
			<xsl:when test="$position = 'right'">
					<fo:block padding-left="1em">
						<fo:external-graphic src="../commonimages/ESTAT.png" content-height="0.8cm" 
						content-width="scale-to-fit" position="absolute" />
					</fo:block>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:attribute-set name="footer.content.properties">
		<xsl:attribute name="font-style">italic</xsl:attribute>
		<xsl:attribute name="font-family">Helvetica</xsl:attribute>
		<xsl:attribute name="font-size">8pt</xsl:attribute>
	</xsl:attribute-set>
	<xsl:template name="footer.content">
		<xsl:param name="pageclass" select="''"/>
		<xsl:param name="sequence" select="''"/>
		<xsl:param name="position" select="''"/>
		<xsl:param name="gentext-key" select="''"/>
		<fo:block>
			<xsl:choose>
				<xsl:when test="$position = 'left'">
					<fo:block>
						<xsl:apply-templates select="../." mode="titleabbrev.markup"/>
					</fo:block>
				</xsl:when>
				<xsl:when test="$position = 'right'">
					<fo:block>
						<fo:page-number/>
					</fo:block>
				 </xsl:when>
			</xsl:choose>
		</fo:block>
	</xsl:template>
	<xsl:param name="shade.verbatim" select="1"/>
	<xsl:param name="header.column.widths">0 0 1</xsl:param>
	<xsl:attribute-set name="shade.verbatim.style">
		<xsl:attribute name="background-color">#E0E0E0</xsl:attribute>
		<xsl:attribute name="border-width">0.5pt</xsl:attribute>
		<xsl:attribute name="border-style">solid</xsl:attribute>
		<xsl:attribute name="border-color">#575757</xsl:attribute>
		<xsl:attribute name="padding">3pt</xsl:attribute>
		<xsl:attribute name="width">99%</xsl:attribute>
	</xsl:attribute-set>
	<xsl:attribute-set name="example.properties">
		<xsl:attribute name="border">0.5pt solid black</xsl:attribute>
		<xsl:attribute name="padding-top">0mm</xsl:attribute>
		<xsl:attribute name="padding-left">3mm</xsl:attribute>
		<xsl:attribute name="padding-right">3mm</xsl:attribute>
		<xsl:attribute name="padding-bottom">2mm</xsl:attribute>
		<xsl:attribute name="width">99%</xsl:attribute>
	</xsl:attribute-set>
</xsl:stylesheet>