// main.go
package main

import (
    "bytes"
    "encoding/json"
    "io/ioutil"
    "net/http"
    "os"
    "strings"
    "github.com/gin-gonic/gin"
    "github.com/gin-contrib/cors"
    "github.com/joho/godotenv"
)

type GeminiRequest struct {
    Contents []struct {
        Parts []struct {
            Text    string `json:"text,omitempty"`
            InlineData struct {
                MimeType string `json:"mimeType"`
                Data     string `json:"data"`
            } `json:"inlineData,omitempty"`
        } `json:"parts"`
    } `json:"contents"`
}

type GeminiResponse struct {
    Candidates []struct {
        Content struct {
            Parts []struct {
                Text string `json:"text"`
            } `json:"parts"`
        } `json:"content"`
    } `json:"candidates"`
}

func analyzeHandler(c *gin.Context,apiKey string) {
    var request struct {
        ImageData string `json:"imageData"`
    }

    if err := c.BindJSON(&request); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }

    // Remove the "data:image/png;base64," prefix
    imageData := strings.Split(request.ImageData, ",")[1]

    // Create Gemini API request
    geminiReq := GeminiRequest{
        Contents: []struct {
            Parts []struct {
                Text    string `json:"text,omitempty"`
                InlineData struct {
                    MimeType string `json:"mimeType"`
                    Data     string `json:"data"`
                } `json:"inlineData,omitempty"`
            } `json:"parts"`
        }{
            {
                Parts: []struct {
                    Text    string `json:"text,omitempty"`
                    InlineData struct {
                        MimeType string `json:"mimeType"`
                        Data     string `json:"data"`
                    } `json:"inlineData,omitempty"`
                }{
                    {
                        Text: "Analyze this image. If it contains mathematical expressions, solve them. If it contains text, interpret it.",
                    },
                    {
                        InlineData: struct {
                            MimeType string `json:"mimeType"`
                            Data     string `json:"data"`
                        }{
                            MimeType: "image/png",
                            Data:     imageData,
                        },
                    },
                },
            },
        },
    }

    jsonData, err := json.Marshal(geminiReq)
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to create request"})
        return
    }

    // Send request to Gemini API
    resp, err := http.Post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key="+apiKey,
        "application/json",
        bytes.NewBuffer(jsonData),
    )
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to contact Gemini API"})
        return
    }
    defer resp.Body.Close()

    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to read response"})
        return
    }

    var geminiResp GeminiResponse
    if err := json.Unmarshal(body, &geminiResp); err != nil {
        c.JSON(500, gin.H{"error": "Failed to parse response"})
        return
    }

    if len(geminiResp.Candidates) > 0 && len(geminiResp.Candidates[0].Content.Parts) > 0 {
        c.JSON(200, gin.H{"result": geminiResp.Candidates[0].Content.Parts[0].Text})
    } else {
        c.JSON(500, gin.H{"error": "No results from Gemini"})
    }
}

func main() {
    // Load .env file
    err := godotenv.Load()
    if err != nil {
        panic("Error loading .env file")
    }

    apiKey := os.Getenv("API_KEY")
    if apiKey == "" {
        panic("API_KEY not set in environment")
    }

    r := gin.Default()
    r.Use(cors.New(cors.Config{
        AllowOrigins: []string{"http://localhost:3000"},
        AllowMethods: []string{"POST", "GET"},
        AllowHeaders: []string{"Content-Type"},
    }))

    // Modify the route handler to pass apiKey
    r.POST("/analyze", func(c *gin.Context) {
        analyzeHandler(c, apiKey)
    })
    
    r.Run(":8080")
}